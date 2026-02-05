"use client"

import * as React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useVpsStore } from "@/hooks/use-vps-store"
import { Server, Shield, Terminal } from "lucide-react"

const setupSchema = z.object({
  name: z.string().min(3, "Name too short"),
  ip: z.string().ip("Invalid IP Address"),
  port: z.coerce.number().default(22),
  username: z.string().min(1, "Username required"),
  password: z.string().min(1, "Password required"),
  workingDir: z.string().startsWith("/", "Path must be absolute").default("/root/furinla")
})

export function SetupVps() {
  const setConfig = useVpsStore((state) => state.setConfig)
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(setupSchema)
  })

  const onSubmit = async (data: any) => {
    // API Call untuk test connection akan diimplementasi di batch selanjutnya
    await new Promise(r => setTimeout(r, 1500))
    setConfig(data)
  }

  return (
    <Card className="border-white/10 shadow-2xl">
      <CardHeader className="text-center">
        <CardTitle className="flex items-center justify-center gap-2 text-2xl">
          <Server className="text-primary" /> VPS Configuration
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs uppercase font-bold text-muted-foreground">Server Name</label>
              <Input {...register("name")} placeholder="My Bot VPS" />
            </div>
            <div className="space-y-2">
              <label className="text-xs uppercase font-bold text-muted-foreground">IP Address</label>
              <Input {...register("ip")} placeholder="1.2.3.4" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs uppercase font-bold text-muted-foreground">Port</label>
              <Input {...register("port")} type="number" />
            </div>
            <div className="space-y-2">
              <label className="text-xs uppercase font-bold text-muted-foreground">Username</label>
              <Input {...register("username")} placeholder="root" />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-xs uppercase font-bold text-muted-foreground">SSH Password</label>
            <Input {...register("password")} type="password" />
          </div>
          <div className="space-y-2">
            <label className="text-xs uppercase font-bold text-muted-foreground">Working Directory</label>
            <Input {...register("workingDir")} placeholder="/root/furinla" />
          </div>
          <Button type="submit" className="w-full mt-6" disabled={isSubmitting}>
            {isSubmitting ? "Testing Secure Connection..." : "Initialize Dashboard"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
