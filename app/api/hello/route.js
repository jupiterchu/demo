import { NextResponse } from "next/server";

// get: localhost:3000/api/hello?keyword=ayuliao
export async function GET(request) {
    const { searchParams } = new URL(request.url);
    // get params: ayuliao
    const keyword = searchParams.get('keyword');

    // logic
   
    return NextResponse.json({
        status: 200,
        data: {
            msg: 'hello get',
            keyword: keyword
        },
    });
}

// post: localhost:3000/api/hello
export async function POST(req) {
    const { key, data } = await req.json()
    return NextResponse.json({
        status: 200,
        data: {
            msg: 'hello post',
            key: key,
            data: data
        },
    });
}