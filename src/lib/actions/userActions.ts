"use server";
import prisma from "@/lib/db";
import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { RegisterForm, RegisterFormSchema } from "@/lib/validation/userSchemas";

/**
 * Registers a new user.
 * @param formData - Registration form data
 */
export async function registerUser(formData: RegisterForm) {
  const parsed = RegisterFormSchema.safeParse(formData);
  if (!parsed.success) {
    throw new Error(parsed.error.errors[0].message);
  }
  const { name, email, password } = parsed.data;

  // Check if email exists
  const existingUser = await prisma.user.findUnique({
    where: { email },
  });
  if (existingUser) {
    throw new Error("Email already registered");
  }

  // Hash password
  const passwordHash = await bcrypt.hash(password, 10);

  // Create user with default role 'member'
  await prisma.user.create({
    data: {
      name,
      email,
      password: passwordHash,
      role: "member",
    },
  });

  // After registration, redirect to login page
  redirect("/login");
}

/**
 * Promotes a user to admin.
 * @param userId - User ID
 */
export async function promoteUser(userId: string) {
  await prisma.user.update({
    where: { id: userId },
    data: { role: "admin" },
  });
}

/**
 * Demotes a user to member.
 * @param userId - User ID
 */
export async function demoteUser(userId: string) {
  await prisma.user.update({
    where: { id: userId },
    data: { role: "member" },
  });
}

/**
 * Gets all users.
 */
export async function getAllUsers() {
  return await prisma.user.findMany();
}

/**
 * Deletes a user by ID.
 * @param userId - User ID
 */
export async function deleteUser(userId: string) {
  await prisma.user.delete({
    where: { id: userId },
  });
}

/**
 * Updates a user's profile.
 * @param formData - FormData containing email, name, and/or password
 */
export async function updateUserProfile(formData: FormData) {
  const email = formData.get("email")?.toString();
  const name = formData.get("name")?.toString();
  const password = formData.get("password")?.toString();

  if (!email) throw new Error("Unauthorized");

  const updates: { name?: string; password?: string } = {};

  if (name) updates.name = name;
  if (password && password.length >= 6) {
    const hashed = await bcrypt.hash(password, 10);
    updates.password = hashed;
  }

  const user = await prisma.user.update({
    where: { email },
    data: updates,
  });

  revalidatePath("/dashboard/settings");
  return user;
}

/**
 * Gets a user by ID.
 * @param id - User ID
 */
export async function getUserById(id: string) {
  return await prisma.user.findUnique({
    where: { id },
  });
}