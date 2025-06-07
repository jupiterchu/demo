'use client'
import React, { useEffect, useState } from 'react'
import { RiVipCrown2Fill } from 'react-icons/ri'
import { BsFillCheckCircleFill } from 'react-icons/bs'
import { useSupabase } from '@/context/supabase-context'
import Loading from '../../loading'
import { toast } from 'react-toastify'
import { useCommonContext } from '@/context/common-context'
import { tiers } from '@/components/common'



const page = () => {
  const { supabase } = useSupabase()
  const { userData } = useCommonContext()
  const [loading, setLoading] = useState(true)
  const [subData, setSubData] = useState()
  const [historys, setHistorys] = useState([])


  async function getUserPayData() {
    try {
      const { data: payment, error } = await supabase
        .from("user_payment_data")
        .select("*")
        .match({ user_id: userData?.id });
      
      if (error) {
        console.error('Error fetching payment data:', error);
        return null;
      }
      
      // 如果有数据，返回第一条记录；如果没有数据，返回 null
      const paymentData = payment && payment.length > 0 ? payment[0] : null;
      console.log('payment: ', paymentData);
      return paymentData;
    } catch (error) {
      console.error('Error in getUserPayData:', error);
      return null;
    }
  }

  async function getUserPayHistory() {
    const { data: historys } = await supabase.from('payment_history').select("*").match({ user_id: userData?.id })
    console.log('historys: ', historys)
    if (historys == null || Object.keys(historys).length == 0) {
      return []
    } else {
      return historys
    }
  }

  async function UpdatePayment() {
    const payData = await getUserPayData();
    if (!payData) {
      toast.error("Unable to fetch payment data");
      return;
    }
    
    window.onPaddleSuccess = function () {
      toast.success("Your payment method was updated successfully");
      // setPaddleChangeTime(Date.now());
    };
    window.onPaddleClose = function () {
      toast.error("You canceled the payment method update");
    };

    Paddle.Checkout.open({
      override: payData.subscription_update_url,
      successCallback: "onPaddleSuccess",
      closeCallback: "onPaddleClose",
    });
  }

  async function CancelSub() {
    if (subData?.planName == 'Freelancer') {
      toast.success('Free plan does not need to be canceled')
      return
    }
    const payData = await getUserPayData();
    if (!payData) {
      toast.error("Unable to fetch payment data");
      return;
    }
    
    window.onPaddleSuccess = function () {
      toast.success(
        "Your subscription was cancelled successfully, We'll miss you 😢"
      );
      // setPaddleChangeTime(Date.now());
    };
    window.onPaddleClose = function () {
      console.log("paddle close");
      toast.success(
        "Your subscription was cancelled fail"
      );
    };

    Paddle.Checkout.open({
      override: payData.subscription_cancel_url,
      successCallback: "onPaddleSuccess",
      closeCallback: "onPaddleClose",
    });
  }


  useEffect(() => {
    (async () => {
      const payData = await getUserPayData() || {}; // 如果返回 null，使用空对象
      
      if (payData?.subscription_id) {
        const result = tiers.filter((item) => item?.pricePaddle?.monthly?.plan_id == parseInt(payData?.subscription_plan_id) || item?.pricePaddle?.annually?.plan_id == parseInt(payData?.subscription_plan_id))
        if (Object.keys(result).length > 0) {
          payData.planName = result[0]?.name
        }
      }

      if (payData?.planName == undefined) {
        payData.planName = 'Freelancer'
      }

      if (payData?.subscription_status == undefined) {
        payData.subscription_status = 'delete'
      }

      const priceTiers = tiers.filter((item) => item.name == payData.planName)
      if (Object.keys(priceTiers).length > 0) {
        payData.priceTier = priceTiers[0]
      }

      const historyData = await getUserPayHistory({ supabase: supabase })
      let data = []
      historyData.forEach((item) => {
        data.push({
          date: item.created_at,
          amount: item.amount,
          receipt_url: item.receipt_url
        })
      })
      setHistorys(data)

      setSubData(payData)
      setLoading(false)
    })()
  }, [])

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
            <div className="mb-4 flex flex-col-reverse items-center justify-between  lg:flex-row">
              <div className="flex items-center text-2xl font-bold space-x-2 mt-3 lg:mt-0">
                <h2 className="mb-0">ProSEOA</h2>
                <span
                  className="ml-1 capitalize text-indigo-600"
                >
                  {subData?.planName}
                </span>
                <RiVipCrown2Fill className=' text-indigo-600 ml-3' />

              </div>
              <div className={subData?.subscription_status == 'active' ? 'bg-green-600 text-white select-none rounded px-3 py-2' : ' bg-red-500 text-white select-none rounded px-3 py-2'}>

                {subData?.subscription_status}

              </div>
            </div>
            <div className="flex w-full flex-col space-y-3">
              {/* <div className="flex">
                                <p className='font-bold'>Subscription End Date {subData?.subscriptionEndDate}</p>
                            </div> */}
              <div className="flex w-full flex-col gap-2">
                {
                  subData?.priceTier?.features?.map((item, index) => (
                    <div key={index} className="flex items-center space-y-1">
                      <BsFillCheckCircleFill className=' text-green-500' />
                      <p className="my-0 ml-2 font-normal">{item}</p>
                    </div>
                  ))
                }
              </div>
            </div>
            <div className="mt-8 flex space-x-4 font-normal">
              <button
                href="/subscription/cancel"
                className="py-3 px-5 rounded-full border border-red-400 text-red-400 font-bold"
                onClick={CancelSub}
              >
                Cancel my plan
              </button>
              {/**/}
              {/**/}
            </div>
          </div>
          <div className="mt-4 flex w-full flex-col space-y-3 lg:space-y-0 items-center justify-between rounded bg-gradient-to-r from-indigo-500 to-[#6C21C6] p-8 text-white lg:flex-row">
            <p className="w-full lg:mb-0 lg:w-1/2 text-lg">
              Upgrade to Enterprise Edition for more generation and storage space!
            </p>
            <div className="flex w-full flex-col lg:w-auto">
              <button
                show-icon="false"
                className="rounded-full bg-white px-4 py-2 text-indigo-600 hover:bg-gray-100 text-lg font-bold"
                onClick={UpdatePayment}
              >
                Upgrade to Enterprise
              </button>
            </div>
          </div>
          <div className="mt-4 flex w-full flex-col">
            <h2 className="mb-1 pb-0 text-3xl font-bold text-[#3f3f3f]">Payments</h2>
            <div className="flex flex-col p-8 rounded-xl border-2">
              <div className="mb-4 flex w-full flex-col justify-between lg:flex-row">
                <div className="flex flex-col items-start gap-2">
                  <img
                    src="/visa.svg"
                    className="h-6"
                    alt="Visa card"
                    loading="lazy"
                  />
                  <p className="opacity-70 font-bold"> Next payment {subData?.subscriptionEndDate}</p>
                </div>
                {/* <button
                                    className=" rounded-full border-2 border-green-400 text-green-400 font-bold text-lg px-4 py-2"
                                    show-icon="false"
                                >
                                    Update payment info
                                </button> */}


              </div>
              <div className="mt-8 flow-root">
                <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
                  <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
                    <table className="min-w-full divide-y divide-gray-300">
                      <thead>
                        <tr>
                          <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-0">
                            Date
                          </th>
                          <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                            Amount
                          </th>
                          <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                            Receipt
                          </th>

                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {historys.map((item, index) => (
                          <tr key={index}>
                            <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-0">
                              {item.date}
                            </td>
                            <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{item.amount}</td>
                            <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                              {/* TODO */}
                              <a target="_blank"  href={item.receipt_url} title="Download receipt" class="cursor-pointer text-indigo-600 hover:text-indigo-900"> show receipt</a>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default page