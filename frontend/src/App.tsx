import { AppShell } from '@/components/layout/app-shell'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'

function App() {
  return (
    <AppShell>
      <div className="space-y-8">
        <section className="space-y-2">
          <Badge variant="secondary">Foundation</Badge>
          <h1>vc.me frontend</h1>
          <p className="max-w-2xl text-muted-foreground">
            React, Tailwind CSS v4, and shadcn/ui with Y Combinator–inspired
            tokens. Light mode only — extend from here.
          </p>
        </section>

        <Separator />

        <section className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Actions</CardTitle>
              <CardDescription>Primary uses YC orange.</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-2">
              <Button>Primary</Button>
              <Button variant="secondary">Secondary</Button>
              <Button variant="outline">Outline</Button>
              <Button variant="ghost">Ghost</Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Form</CardTitle>
              <CardDescription>Inputs wired to design tokens.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" placeholder="founder@startup.com" />
              </div>
              <Button className="w-full sm:w-auto">Continue</Button>
            </CardContent>
          </Card>
        </section>

        <Card>
          <CardHeader>
            <CardTitle>Brand tokens</CardTitle>
            <CardDescription>
              Raw values live in{' '}
              <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-sm">
                src/styles/yc-tokens.css
              </code>
              . Semantic shadcn tokens are in{' '}
              <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-sm">
                src/index.css
              </code>
              .
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-4">
              <Swatch name="Orange" className="bg-yc-orange" />
              <Swatch name="Orange muted" className="bg-yc-orange-muted" />
              <Swatch name="Gray 900" className="bg-foreground" />
              <Swatch name="Gray 200" className="bg-border" />
            </div>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  )
}

function Swatch({ name, className }: { name: string; className: string }) {
  return (
    <div className="flex items-center gap-3">
      <div
        className={`size-10 rounded-md border border-border shadow-sm ${className}`}
      />
      <span className="text-sm text-muted-foreground">{name}</span>
    </div>
  )
}

export default App
