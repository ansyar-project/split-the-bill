"use client";
import React from "react";

const CopyButton = ({ inviteUrl }: { inviteUrl: string }) => {
  return (
    <button
      className="px-3 py-2 bg-blue-600 rounded hover:bg-blue-700 text-sm"
      onClick={async () => {
        await navigator.clipboard.writeText(inviteUrl);
        alert("Link copied to clipboard!");
      }}
    >
      Copy
    </button>
  );
};

export default CopyButton;
