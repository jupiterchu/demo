'use client'
import React, { useState } from 'react'
import { useSupabase } from '@/context/supabase-context';
import { useRouter } from 'next/navigation'
import { HiOutlineArrowNarrowRight } from 'react-icons/hi'
import { whiteLoadingSvg, blackLoadingSvg } from './svg';
import { useCommonContext } from '@/context/common-context';

const LoginButton = ({ buttonType }) => {
    const { supabase } = useSupabase();

    const router = useRouter();

    const { userData, setUserData, showLoginModal, setShowLoginModal } = useCommonContext()
    const [loading, setLoading] = useState(false)

    async function login(event) {
        event.preventDefault();
        setLoading(true)

        let _userData
        if (userData == null || Object.keys(userData).length == 0) {
            const { data } = await supabase.auth.getUser()
            setUserData(data?.user)
            _userData = data?.user
        } else {
            _userData = userData
        }

        if (_userData != null && Object.keys(_userData).length != 0) {
            router.push(`/apps`);
        } else {
            setShowLoginModal(true)
            setLoading(false)
        }

    }


    return (
        <>
            {
                buttonType == 0 && (
                    <>
                        {
                            loading ? (
                                <button href="#" className=" flex flex-row items-center justify-center space-x-3 rounded-lg px-3 py-2.5 text-base font-semibold leading-7 text-gray-900 "
                                    disabled
                                >
                                    <p> Login...</p>
                                    {blackLoadingSvg}

                                </button>
                            ) : (
                                <button
                                    className="-mx-3 block rounded-lg px-3 py-2.5 text-base font-semibold leading-7 text-gray-900 hover:bg-gray-50"
                                    onClick={login}
                                >
                                    Log in
                                </button>
                            )
                        }
                    </>

                )
            }


        </>
    )
}

export default LoginButton