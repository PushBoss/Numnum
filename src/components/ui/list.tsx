"use client";

import * as React from "react"

import { cn } from "@/lib/utils"

const List = React.forwardRef<
  HTMLUListElement,
  React.HTMLAttributes<HTMLUListElement>
>(({ className, ...props }, ref) => (
  <ul ref={ref} className={cn("list-none p-0", className)} {...props} />
))
List.displayName = "List"

const ListItem = React.forwardRef<
  HTMLLIElement,
  React.HTMLAttributes<HTMLLIElement>
>(({ className, ...props }, ref) => (
  <li
    ref={ref}
    className={cn("flex items-center justify-between py-2", className)}
    {...props}
  />
))
ListItem.displayName = "ListItem"

const ListHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("font-semibold py-2", className)} {...props} />
))
ListHeader.displayName = "ListHeader"

const ListEmpty = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p ref={ref} className={cn("text-sm text-muted-foreground py-2", className)} {...props} />
))
ListEmpty.displayName = "ListEmpty"

const ListAction = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement>
>(({ className, ...props }, ref) => (
  <button ref={ref} className={cn("text-sm hover:underline", className)} {...props} />
))
ListAction.displayName = "ListAction"

export { List, ListItem, ListHeader, ListEmpty, ListAction }
