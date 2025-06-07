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
  const [subscriptions, setSubscriptions] = useState([])
  const [openPortalLoadig, setOpenPortalLoading] = useState(false)

  useEffect(() => {
    (async () => {
      try {
        let { data: subscriptionsData, error } = await supabase
          .from('subscriptions')
          .select('*')
          .eq('status', 'active')
          .order('created', { ascending: false });
        
        if (error) {
          console.error('Error fetching subscriptions:', error);
          setSubscriptions([]);
          return;
        }

        console.log('subscriptions: ', subscriptionsData);

        if (subscriptionsData && subscriptionsData.length > 0) {
          const processedSubscriptions = subscriptionsData.map(subscription => {
            const matchedTier = tiers.find((item) => 
              item?.priceStripe?.monthly?.id === subscription?.price_id ||
              item?.priceStripe?.annually?.id === subscription?.price_id
            );
            
            return {
              ...subscription,
              tierInfo: matchedTier || null,
              subscriptionStatus: subscription.status
            };
          });
          
          setSubscriptions(processedSubscriptions);
        } else {
          setSubscriptions([]);
        }
      } catch (error) {
        console.error('Error in subscription fetch:', error);
        setSubscriptions([]);
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
      setOpenPortalLoading(false);
      if (error?.message?.includes('No configuration provided')) {
        toast.error('Customer portal is not configured yet. Please contact support.');
      } else {
        toast.error(error?.message || 'Failed to open customer portal');
      }
      console.error('Customer portal error:', error);
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
              <h2 className="mb-1 pb-0 text-2xl">Your plans</h2>
              {subscriptions.length === 0 && (
                <p className="text-gray-500 mt-2">No active subscriptions found.</p>
              )}
            </div>
          </div>
          
          {subscriptions.map((subscription, index) => (
            <div key={subscription.id} className="flex flex-col p-8 rounded-xl border-2">
              <div className="mb-4 flex flex-row items-center justify-between lg:flex-row">
                <div className="flex items-center text-2xl font-bold space-x-2 mt-3 lg:mt-0">
                  <h2 className="mb-0">go-sea</h2>
                  <span className="ml-1 capitalize text-indigo-600">
                    {subscription.tierInfo?.name || 'Unknown Plan'}
                  </span>
                  <RiVipCrown2Fill className=' text-indigo-600 ml-3' />
                  {index === 0 && (
                    <span className="ml-2 bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded">
                      Latest
                    </span>
                  )}
                </div>
                <div className={subscription.subscriptionStatus === 'active' ? 'bg-green-600 text-white select-none rounded px-3 py-2' : ' bg-red-500 text-white select-none rounded px-3 py-2'}>
                  {subscription.subscriptionStatus}
                </div>
              </div>
              
              <div className="flex w-full flex-col space-y-3">
                <div className="flex w-full flex-col gap-2">
                  {subscription.tierInfo?.features?.map((feature, featureIndex) => (
                    <div key={featureIndex} className="flex items-center space-y-1">
                      <BsFillCheckCircleFill className=' text-green-500' />
                      <p className="my-0 ml-2 font-normal">{feature}</p>
                    </div>
                  ))}
                </div>
                
                <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-semibold">Created:</span> {new Date(subscription.created).toLocaleDateString()}
                    </div>
                    <div>
                      <span className="font-semibold">Current Period:</span> {new Date(subscription.current_period_start).toLocaleDateString()} - {new Date(subscription.current_period_end).toLocaleDateString()}
                    </div>
                    <div>
                      <span className="font-semibold">Price ID:</span> {subscription.price_id}
                    </div>
                    <div>
                      <span className="font-semibold">Cancel at period end:</span> {subscription.cancel_at_period_end ? 'Yes' : 'No'}
                    </div>
                  </div>
                </div>
              </div>
              
              {index === 0 && (
                <div className="mt-8 flex space-x-4 font-normal">
                  {openPortalLoadig ? (
                    <button
                      className="py-3 px-5 rounded-full border text-indigo-400 font-bold border-indigo-600 flex items-center justify-center space-x-3"
                      onClick={redirectToCustomerPortal}
                    >
                      <p>Opening...</p>
                      {blackLoadingSvg}
                    </button>
                  ) : (
                    <button
                      className="py-3 px-5 rounded-full border text-indigo-400 font-bold border-indigo-600"
                      onClick={redirectToCustomerPortal}
                    >
                      Open customer portal
                    </button>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default page