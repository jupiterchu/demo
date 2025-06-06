'use client'
import React, { useEffect, useState } from 'react'
import { useSupabase } from '@/context/supabase-context'
import { useSearchParams } from 'next/navigation'
import { useCommonContext } from '@/context/common-context'
import { Player } from '@lottiefiles/react-lottie-player';
import { getStripe } from '@/libs/stripe-client'
import ErrorModal from '@/components/ErrorModal'
import { postData } from '@/libs/helpers'

const page = () => {

    const searchParams = useSearchParams()

    const access_token = searchParams.get('access_token')
    const refresh_token = searchParams.get('refresh_token')
    const price_id = searchParams.get('price')
    const product_id = searchParams.get('product')

    const { supabase } = useSupabase()

    const [open, setOpen] = useState(false)
    const [error, setError] = useState({
        title: '',
        content: ''
    })


    useEffect(() => {
        init()
    }, [])


    async function init() {

        const resp = await supabase.auth.setSession({
            access_token: access_token,
            refresh_token: refresh_token,
        });

        const user = resp.data?.user;
        if(user) {
            await openStripe({
                price: {
                    type: 'recurring',
                    id: price_id,
                    product_id: product_id
                  }
            })
        } else {
            setError({
                title: 'Get User Info Fail',
                content: 'Please login again.'
            })

            setOpen(true)
        }
        
    }


    const openStripe = async ({
        price
      }) => {
        // if (!userData) {
        //   setShowLoginModal(true)
        //   return
        // }
        // if (price.product_id === subscription?.prices?.products?.id) {
        //   return router.push('/subscription');
        // }
        try {
          const { sessionId } = await postData({
            url: '/api/create-checkout-session',
            data: { price }
          });
    
          const stripe = await getStripe();
          stripe?.redirectToCheckout({ sessionId });
    
        } catch (error) {
          return alert((error)?.message);
        } 
    
      };


    return (
        <div>
            <ErrorModal open={open} setOpen={setOpen} title={error.title} content={error.content} />
        <div className="my-16 flex justify-center flex-col w-full items-center">
            <Player
                src='https://assets7.lottiefiles.com/packages/lf20_g3ki3g0v.json'
                className="player"
                loop
                autoplay
                style={{ width: "420px" }}
            />
            <p className=' text-3xl font-bold mb-6'>go sea Extension Open payment in progress, please wait.</p>
            <p className=' text-3xl font-bold'>Please do not close the current page.</p>
        </div>
    </div>
    )
}

export default page