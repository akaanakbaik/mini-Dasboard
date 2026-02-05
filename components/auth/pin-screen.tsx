"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp"
import { useToast } from "@/components/ui/use-toast"
import { Lock, ShieldCheck } from "lucide-react"

export function PinScreen({ onSuccess }: { onSuccess: () => void }) {
  const [value, setValue] = React.useState("")
  const [isVerifying, setIsVerifying] = React.useState(false)
  const { toast } = useToast()

  const handleComplete = async (pin: string) => {
    setIsVerifying(true)
    
    const masterPin = process.env.NEXT_PUBLIC_DASHBOARD_PIN || "123456"
    
    await new Promise(r => setTimeout(r, 800))

    if (pin === masterPin) {
      toast({
        title: "Access Granted",
        description: "Welcome back to Furinla Control.",
      })
      onSuccess()
    } else {
      setValue("")
      toast({
        variant: "destructive",
        title: "Invalid PIN",
        description: "Access denied. Please check your credentials.",
      })
    }
    setIsVerifying(false)
  }

  return (
    <div className="flex flex-col items-center justify-center space-y-8 p-4">
      <motion.div 
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="p-6 rounded-full bg-primary/10 border border-primary/20 shadow-[0_0_40px_rgba(59,130,246,0.3)]"
      >
        <Lock className="w-12 h-12 text-primary" />
      </motion.div>
      
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-primary">Secure Access</h1>
        <p className="text-muted-foreground">Enter your 6-digit Security PIN</p>
      </div>

      <div className="relative">
        <InputOTP
          maxLength={6}
          value={value}
          onChange={setValue}
          onComplete={handleComplete}
          disabled={isVerifying}
        >
          <InputOTPGroup className="gap-2 sm:gap-4">
            {[...Array(6)].map((_, i) => (
              <InputOTPSlot 
                key={i} 
                index={i} 
                className="w-10 h-12 sm:w-12 sm:h-14 text-xl border-white/10 bg-black/20 backdrop-blur-md"
              />
            ))}
          </InputOTPGroup>
        </InputOTP>
      </div>

      {isVerifying && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex items-center gap-2 text-sm text-primary animate-pulse"
        >
          <ShieldCheck className="w-4 h-4" />
          Verifying credentials...
        </motion.div>
      )}
    </div>
  )
}
