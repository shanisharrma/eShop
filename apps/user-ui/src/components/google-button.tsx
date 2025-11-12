import { GoogleIcon } from "@/assets/svgs"
import React from "react"

const GoogleButton = ()=> {
  return (
    <div className="w-full flex justify-center">
      <div className="h-[45px] cursor-pointer border border-blue-100 flex gap-2 items-center justify-between px-4 py-4 rounded-[4px] bg-blue-50">
        <GoogleIcon />
        <span className="text-[16px] opacity-[.8] font-Poppins">
          Sign In with Google
        </span>
      </div>
    </div>
  )
}

export default GoogleButton;
