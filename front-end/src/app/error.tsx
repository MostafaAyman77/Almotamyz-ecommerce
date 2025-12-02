"use client";

import Link from "next/link"

interface IErorrPageProps {
    error: Error,
    reset: () => void
}



const error = ({ error, reset }: IErorrPageProps) => {
  return (
    <>
    <div className="flex flex-col items-center justify-center gap-8 mt-10">
        <h1 className="text-red-700 text-2xl font-bold">Error</h1>
    <p className="text-lg text-gray-600">{error?.message}</p>
    <button className="bg-blue-500 hover:bg-blue-700 text-white rounded-full px-4 py-2" onClick={() => reset()}>Try Again</button>
    <Link href={"/"} className="bg-blue-400 px-4 py-2 rounded-md hover:bg-blue-500 text-white">Go To Home Page</Link>
    </div>
    </>
  )
}

export default error