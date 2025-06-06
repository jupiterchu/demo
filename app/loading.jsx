'use client'
import { DotLottieReact } from '@lottiefiles/dotlottie-react';

export default function Loading() {
    return (
        <div>
            <div className="my-16 flex justify-center">
                <DotLottieReact
                    src='https://lottie.host/65edf7dd-af2c-4082-8c5e-ce40f2748987/daar21LlsW.lottie'
                    className="player"
                    loop
                    autoplay
                    style={{ width: "420px" }}
                />
            </div>
        </div>
    )
    // return (
    //     <DotLottieReact
    //       src="https://lottie.host/65edf7dd-af2c-4082-8c5e-ce40f2748987/daar21LlsW.lottie"
    //       loop
    //       autoplay
    //     />
    //   );
}
