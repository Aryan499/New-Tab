
import { SignedIn, SignedOut, SignOutButton } from '@clerk/nextjs'
import SearchBar from "@/components/SearchBar/SearchBar";
import DayPlanner from "@/components/DayPlanner/DayPlanner";
import TimeDisplay from "@/components/TimeDisplay/TimeDisplay";
import SiginComponent from "@/components/Auth/Signin/Signin";
import { Button } from '@/components/ui/button';
import { LogOut, Quote } from 'lucide-react';
import Quotes from '@/components/Quotes/Quotes';



export default function Home() {

  return (
    <>
      <div className="min-h-screen bg-background font-inter px-4">
        <div className='w-full flex justify-end p-4'>
          <SignedIn>
            <SignOutButton>
              <Button className='cursor-pointer'>
                <LogOut /> Log out
              </Button>
            </SignOutButton>
          </SignedIn>
        </div>
        
        <div className='flex items-center justify-center'>
          <div className="w-full max-w-[700px] flex flex-col">
            <div className='mb-5'>
              <TimeDisplay />
             <Quotes/>
            </div>
            <div className="flex justify-center">
              <SearchBar />
            </div>
            <div className="mt-12 flex justify-center items-center w-full">
              <SignedOut>
                <SiginComponent />
              </SignedOut>
              <SignedIn>
                
                  <DayPlanner />
              
              </SignedIn>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}