"use client";

import { Toaster as Sonner } from "sonner";

type ToasterProps = React.ComponentProps<typeof Sonner>;

export function Toaster({ ...props }: ToasterProps) {
  return (
    <Sonner
      theme="dark"
      position="bottom-right"
      toastOptions={{
        classNames: {
          toast:
            "group bg-zinc-900 border-zinc-700 text-white shadow-lg rounded-lg",
          title: "text-white font-semibold",
          description: "text-zinc-400",
          actionButton: "bg-yellow-500 text-black font-bold",
          cancelButton: "bg-zinc-700 text-white",
          success: "border-green-500/50 bg-green-500/10",
          error: "border-red-500/50 bg-red-500/10",
          warning: "border-yellow-500/50 bg-yellow-500/10",
          info: "border-blue-500/50 bg-blue-500/10",
        },
      }}
      {...props}
    />
  );
}
