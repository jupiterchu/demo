'use client'
import { Player } from '@lottiefiles/react-lottie-player';

export default function Loading() {
    return (
        <div>
            <div className="my-16 flex justify-center flex-col w-full items-center">
                <Player
                    src='https://assets1.lottiefiles.com/packages/lf20_m3ixidnq.json'
                    className="player"
                    loop
                    autoplay
                    style={{ width: "420px" }}
                />
                <p className=' text-3xl font-bold mb-6'>Go Sea Extension Login Success!</p>
                <p className=' text-3xl font-bold'>Close This Page and Reopen Go Sea Extension now.</p>
            </div>
        </div>


    )
}
