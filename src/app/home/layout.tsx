import Shell from "@/components/shell";

export default function HomeLayout({
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
