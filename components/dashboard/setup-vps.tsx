"use client"

import * as React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useVpsStore } from "@/store/vps-store"
import { Server, Shield, Loader2 } from "lucide-react"
import { encryptData } from "@/lib/encryption"
import { supabase } from "@/lib/supabase"
import { useToast } from "@/components/ui/use-toast"
import axios from "axios"

const setupSchema = z.object({
  name: z.string().min(3, "Name too short"),
  ip: z.string().ip("Invalid IP Address"),
  port: z.coerce.number().default(22),
  username: z.string().min(1, "Username required"),
  password: z.string().min(1, "Password required"),
  workingDir: z.string().startsWith("/", "Path must be absolute").default("/root/furinla")
})

export function SetupVps() {
  const { setActiveProfile } = useVpsStore()
  const { toast } = useToast()
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(setupSchema),
    defaultValues: {
      name: "My Bot VPS",
      port: 22,
      workingDir: "/root/furinla"
    }
  })

  const onSubmit = async (data: any) => {
    try {
      const testRes = await axios.post("/api/ssh/test", {
        host: data.ip,
        port: data.port,
        username: data.username,
        password: data.password
      })

      if (!testRes.data.success) {
        throw new Error(testRes.data.message || "Connection failed")
      }

      const encryptedPassword = await encryptData(data.password)

      const { data: profile, error } = await supabase
        .from('vps_profiles')
        .insert({
          name: data.name,
          ip: data.ip,
          ssh_port: data.port,
          username: data.username,
          encrypted_password: encryptedPassword,
          working_directory: data.workingDir
        })
        .select()
        .single()

      if (error) throw error

      setActiveProfile({
        ...profile,
        ip_address: profile.ip,
        working_directory: profile.working_directory
      })
      
      toast({ title: "VPS Connected", description: "Setup completed successfully." })

    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Setup Failed",
        description: error.message || "Could not connect to VPS"
      })
    }
  }

  return (
    <Card className="border-white/10 shadow-2xl w-full max-w-2xl mx-auto backdrop-blur-xl bg-black/40">
      <CardHeader className="text-center pb-2">
        <div className="mx-auto w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center mb-4 text-primary">
          <Server className="w-6 h-6" />
        </div>
        <CardTitle className="text-2xl">Connect VPS</CardTitle>
        <CardDescription>Enter your SSH credentials to initialize the dashboard.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs uppercase font-bold text-muted-foreground">Name</label>
              <Input {...register("name")} placeholder="Bot Server 1" />
              {errors.name && <p className="text-xs text-red-500">{errors.name.message as string}</p>}
            </div>
            <div className="space-y-2">
              <label className="text-xs uppercase font-bold text-muted-foreground">IP Address</label>
              <Input {...register("ip")} placeholder="192.168.1.1" />
              {errors.ip && <p className="text-xs text-red-500">{errors.ip.message as string}</p>}
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
            <div className="relative">
              <Input {...register("password")} type="password" className="pr-10" />
              <Shield className="absolute right-3 top-2.5 w-4 h-4 text-muted-foreground" />
            </div>
            {errors.password && <p className="text-xs text-red-500">{errors.password.message as string}</p>}
          </div>

          <div className="space-y-2">
            <label className="text-xs uppercase font-bold text-muted-foreground">Working Directory</label>
            <Input {...register("workingDir")} placeholder="/root/furinla" />
            <p className="text-[10px] text-muted-foreground">This dashboard will be locked to this folder.</p>
          </div>

          <Button type="submit" className="w-full mt-6 h-12 text-base font-semibold" disabled={isSubmitting}>
            {isSubmitting ? (
              <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Verifying Connection...</>
            ) : (
              "Secure Connect & Save"
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
