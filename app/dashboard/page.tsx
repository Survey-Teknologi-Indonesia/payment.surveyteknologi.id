import { redirect } from "next/navigation";

export default function dashboard(){
  return(
    redirect("/dashboard/invoiceGenerator")
  )
}