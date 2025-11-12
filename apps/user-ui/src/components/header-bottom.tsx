"use client";

import { CartIcon, HeartIcon, ProfileIcon } from "@/assets/svgs";
import { navItems, TNavItem } from "@/configs/constants";
import { AlignLeft, ChevronDownIcon, ChevronUpIcon } from "lucide-react";
import Link from "next/link";
import React, {useEffect, useState} from "react"


const HeaderBottom = () => {
  const [show, setShow] = useState(false);
  const [isSticky, setIsSticky] = useState(false);

  // Track scroll prosition
  useEffect(() => {
    const handleScroll = () => {
      if(window.scrollY > 100) {
        setIsSticky(true);
      } else {
        setIsSticky(false)
      }
    }

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [])

  return (
    <div className={`w-full transition-all duration-300 ease-in-out ${isSticky ? "fixed top-0 left-0 z-[100] bg-white shadow-lg" : "relative"}`}>
      <div className={`w-[80%] relative m-auto flex items-center justify-between ${isSticky ? "pt-3" : "py-0"}`}>
        {/*All Dropdowns*/}
        <div className={`w-[260px] ${isSticky && "-mb-4"} cursor-pointer flex items-center justify-between px-5 h-[50px] bg-[#3489ff] `} onClick={() => setShow(!show)}>
          <div className="flex items-center gap-2">
            <AlignLeft color="#fff" />
            <span className="text-white font-medium">All Categories</span>
          </div>
          {show ? <ChevronDownIcon color="white" /> : <ChevronUpIcon color="white" />}
        </div>

        {/*Dropdown menu*/}
        {show && (
          <div className={`absolute left-0 ${isSticky ? "top-[80px]" : "top-[50px]"} w-[260px] h-[400px] bg-[#f5f5f5]`}>

          </div>
        )}

        {/*Navigation Links*/}
        <div className="flex items-center">
          {navItems.map((item:TNavItem, index: number) => (
            <Link className="px-5 font-medium text-lg" key={index} href={item.href}>
              {item.title}
            </Link>
          ))}
        </div>

          {isSticky && (
        <div className="w-[15%]">
            <div className='w-[100%] py-2 m-auto flex items-center justify-between'>
              <div className='flex items-center gap-8'>
                <div className="flex items-center gap-2">
                  <Link href={"/login"} className='border-2 w-[50px] h-[50px] flex items-center justify-center rounded-full border-[#010f1c1a]'>
                    <ProfileIcon />
                  </Link>
                </div>
                <Link href={"/login"}>
                  <span className='block font-medium'>Hello,</span>
                  <span className='font-semibold'>Sign In</span>
                </Link>
              </div>
              <div className='flex items-center gap-5'>
                <Link href={"/wishlist"} className='relative'>
                  <HeartIcon />
                  <div className='w-6 h-6 border-2 border-white bg-red-500 rounded-full flex items-center justify-center absolute top-[-10px] right-[-10px]'>
                    <span className='text-white font-medium text-sm'>0</span>
                  </div>
                </Link>
                <Link href={"/wishlist"} className='relative'>
                  <CartIcon />
                  <div className='w-6 h-6 border-2 border-white bg-red-500 rounded-full flex items-center justify-center absolute top-[-10px] right-[-10px]'>
                    <span className='text-white font-medium text-sm'>0</span>
                  </div>
                </Link>
              </div>
            </div>
        </div>
          )}
      </div>
    </div>
  )
}

export default HeaderBottom;
