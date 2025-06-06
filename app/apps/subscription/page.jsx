'use client'
import React, { useEffect, useState } from 'react'
import { RiVipCrown2Fill } from 'react-icons/ri'
import { BsFillCheckCircleFill } from 'react-icons/bs'
import { toast } from 'react-toastify'
import { useRouter } from 'next/navigation';
import Loading from '@/app/loading'
import { useSupabase } from '@/context/supabase-context'
import { useCommonContext } from '@/context/common-context'
import { postData } from '@/libs/helpers'
import { tiers, frequencies } from '@/components/common'
import { blackLoadingSvg } from '@/components/svg'


const page = () => {
  const { supabase } = useSupabase()
  const router = useRouter();

  const [loading, setLoading] = useState(false)
  const [subData, setSubData] = useState()
  const [openPortalLoadig, setOpenPortalLoading] = useState(false)



  useEffect(() => {
    (async () => {
      let { data: subscription } = await supabase
        .from('subscriptions')
        .select('*')  
        .single()
        .throwOnError();
      console.log('subscription: ', subscription)

      const result = tiers.filter((item) => item?.priceStripe?.monthly?.id == subscription?.price_id ||item?.priceStripe?.annually?.id == subscription?.price_id  )
      if(Object.keys(result).length > 0) {
        const sub = result[0]
        sub['subscriptionStatus'] = subscription.status
        setSubData(result[0])
      } else {
        setSubData({})
      }
    })()

  }, [])

  const redirectToCustomerPortal = async () => {
    setOpenPortalLoading(true)
    try {
      const { url } = await postData({
        url: '/api/create-portal-link'
      });
      router.push(url);
    } catch (error) {
      if (error) return alert((error).message);
    }
  };




  if (loading) return <Loading />

  return (
    <div>
      <div className=' container mx-auto flex flex-grow items-start flex-col p-16'>

        <div className="flex w-full flex-col space-y-5">
          <div className="flex w-full flex-col space-y-3">
            <h1 className="mb-1 text-3xl font-bold">Subscription management</h1>
            <div className="flex w-full flex-col">
              <h2 className="mb-1 pb-0 text-2xl">Your plan</h2>
            </div>
          </div>
          <div className="flex flex-col  p-8 rounded-xl border-2">
            <div className="mb-4 flex flex-row items-center justify-between  lg:flex-row">
              <div className="flex items-center text-2xl font-bold space-x-2 mt-3 lg:mt-0">
                <h2 className="mb-0">go-sea</h2>
                <span
                  className="ml-1 capitalize text-indigo-600"
                >
                  {subData?.name}
                </span>
                <RiVipCrown2Fill className=' text-indigo-600 ml-3' />

              </div>
              <div className={subData?.subscriptionStatus == 'active' ? 'bg-green-600 text-white select-none rounded px-3 py-2' : ' bg-red-500 text-white select-none rounded px-3 py-2'}>

                {subData?.subscriptionStatus}

              </div>
            </div>
            <div className="flex w-full flex-col space-y-3">
             
              <div className="flex w-full flex-col gap-2">
                {
                  subData?.features?.map((item, index) => (
                    <div key={index} className="flex items-center space-y-1">
                      <BsFillCheckCircleFill className=' text-green-500' />
                      <p className="my-0 ml-2 font-normal">{item}</p>
                    </div>
                  ))
                }
              </div>
            </div>
            <div className="mt-8 flex space-x-4 font-normal">
              {
                openPortalLoadig ? (
                  <button
                  className="py-3 px-5 rounded-full border  text-indigo-400 font-bold border-indigo-600 flex items-center justify-center space-x-3"
                  onClick={redirectToCustomerPortal}
                >
                 <p> Opening...</p>
                  {blackLoadingSvg}
                </button>
                ): (
                  <button
                  className="py-3 px-5 rounded-full border  text-indigo-400 font-bold border-indigo-600"
                  onClick={redirectToCustomerPortal}
                >
                  Open customer portal
                </button>
                )
              }
             
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}

export default page