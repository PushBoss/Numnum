import Shell from "@/components/shell";

export default function AccountLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <Shell>
      {children}
    </Shell>
  )
}
