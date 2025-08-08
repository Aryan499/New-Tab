import React from 'react'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CalendarDays } from 'lucide-react';
import { SignInButton } from '@clerk/nextjs';
import { Button } from '@/components/ui/button';
import Image from 'next/image';

const SiginComponent = () => {

    const currentDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    day: 'numeric',
    month: 'long'
  });
 
  
  return (
    <>
     <Card className="w-full bg-gray-900 border-gray-800 shadow-2xl">
        <CardHeader className="pb-3 sm:pb-4 border-b border-gray-800">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="p-1.5 sm:p-2 bg-gray-800 rounded-xl border border-gray-700">
                <CalendarDays className="h-4 w-4 sm:h-5 sm:w-5 text-gray-300" />
              </div>
              <div>
                <CardTitle className="text-base sm:text-lg font-semibold text-white">
                {currentDate}
                </CardTitle>
</div>
</div>
</div>

        </CardHeader>
         <CardContent className="space-y-2 pt-4 justify-center flex items-center cursor-pointer">
<SignInButton
 oauthFlow="redirect"
  
 
 >
  <Button>
    <Image 
      src="/google.png" 
      alt="Google"
      width={32}
      height={32}
      className="w-5 h-5 mr-2"
    />
    Continue with Google
  </Button>
</SignInButton>

         </CardContent>
         </Card>
    </>
  )
}

export default SiginComponent