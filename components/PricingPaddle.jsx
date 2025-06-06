'use client'
import { useState, useEffect } from 'react'
import { RadioGroup } from '@headlessui/react'
import { CheckIcon } from '@heroicons/react/20/solid'
import { toast } from "react-toastify";
import { useSupabase } from '@/context/supabase-context';
import { frequencies, tiers } from './common';
import { useRouter } from 'next/navigation'

function classNames(...classes) {
    return classes.filter(Boolean).join(' ')
}

export default function PricingPaddle() {
    const { supabase } = useSupabase()
    const router = useRouter();
    const [frequency, setFrequency] = useState(frequencies[0])

    // https://blog.sethcorker.com/question/how-to-solve-referenceerror-next-js-window-is-not-defined/
    useEffect(() => {
        window.onPaddleSuccess = function () {
            toast.success('Payment successful, thanks')
            router.push('/apps/paddle-subscription')
        };

        // paddle支付页面被关闭
        window.onPaddleClose = function () {
            toast.error("Payment Failure, paddle close!");
        };
    }, [])


    async function showPaddle({ planId }) {
        const {
            data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
            toast.error('Please login to Go Sea first')
            return
        }

        Paddle.Checkout.open({
            product: planId,
            email: user.email,
            disableLogout: true,
            passthrough: JSON.stringify({
                user_id: user.id,
            }),
            closeCallback: "onPaddleClose",
            successCallback: "onPaddleSuccess",
        });
    }


    return (
        <div className="bg-white">

            <div className="mx-auto max-w-7xl px-6 lg:px-8">
                <div className="mx-auto max-w-4xl text-center">
                    <h2 className="text-base font-semibold leading-7 text-indigo-600">Pricing</h2>
                    <p className="mt-2 text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
                        Plans that best suit your business requirements
                    </p>
                </div>

                <div className="mt-16 flex justify-center">
                    <RadioGroup
                        value={frequency}
                        onChange={setFrequency}
                        className="grid grid-cols-2 gap-x-1 rounded-full p-1 text-center text-xs font-semibold leading-5 ring-1 ring-inset ring-gray-200"
                    >
                        <RadioGroup.Label className="sr-only">Payment frequency</RadioGroup.Label>
                        {frequencies.map((option) => (
                            <RadioGroup.Option
                                key={option.value}
                                value={option}
                                className={({ checked }) =>
                                    classNames(
                                        checked ? 'bg-indigo-600 text-white' : 'text-gray-500',
                                        'cursor-pointer rounded-full px-2.5 py-1'
                                    )
                                }
                            >
                                <span>{option.label}</span>
                            </RadioGroup.Option>
                        ))}
                    </RadioGroup>
                </div>
                <div className="isolate mx-auto mt-10 grid max-w-md grid-cols-1 gap-8 lg:mx-0 lg:max-w-none lg:grid-cols-3">
                    {tiers.map((tier) => (
                        <div
                            key={tier.id}
                            className={classNames(
                                tier.mostPopular ? 'ring-2 ring-indigo-600' : 'ring-1 ring-gray-200',
                                'rounded-3xl p-8 xl:p-10'
                            )}
                        >
                            <div className="flex items-center justify-between gap-x-4">
                                <h3
                                    id={tier.id}
                                    className={classNames(
                                        tier.mostPopular ? 'text-indigo-600' : 'text-gray-900',
                                        'text-lg font-semibold leading-8'
                                    )}
                                >
                                    {tier.name}
                                </h3>
                                {tier.mostPopular ? (
                                    <p className="rounded-full bg-indigo-600/10 px-2.5 py-1 text-xs font-semibold leading-5 text-indigo-600">
                                        Most popular
                                    </p>
                                ) : null}
                            </div>
                            <p className="mt-4 text-sm leading-6 text-gray-600">{tier.description}</p>
                            <p className="mt-6 flex items-baseline gap-x-1">
                                <span className="text-4xl font-bold tracking-tight text-gray-900">{tier.price[frequency.value]}</span>
                                <span className="text-sm font-semibold leading-6 text-gray-600">{frequency.priceSuffix}</span>
                            </p>
                            <button
                                aria-describedby={tier.id}
                                className={classNames(
                                    tier.mostPopular
                                        ? 'bg-indigo-600 text-white shadow-sm hover:bg-indigo-500'
                                        : 'text-indigo-600 ring-1 ring-inset ring-indigo-200 hover:ring-indigo-300',
                                    'mt-6 block rounded-md py-2 px-3 text-center text-sm font-semibold leading-6 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 w-full'
                                )}
                                
                                onClick={() => {
                                    showPaddle({ planId: tier?.pricePaddle[frequency.value]?.plan_id })
                                }}
                            >
                                Buy plan
                            </button>
                            <ul role="list" className="mt-8 space-y-3 text-sm leading-6 text-gray-600 xl:mt-10">
                                {tier.features.map((feature) => (
                                    <li key={feature} className="flex gap-x-3">
                                        <CheckIcon className="h-6 w-5 flex-none text-indigo-600" aria-hidden="true" />
                                        {feature}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}
