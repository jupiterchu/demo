import fs from "fs";
import Markdown from "markdown-to-jsx";
import matter from "gray-matter";
import getPostMetadata from "../../getPostMetadata";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const getPostContent = (slug) => {
    const folder = "posts/";
    const file = `${folder}${slug}.md`;
    const content = fs.readFileSync(file, "utf8");
    const matterResult = matter(content);
    return matterResult;
};

export const generateStaticParams = async () => {
    const posts = getPostMetadata();
    return posts.map((post) => ({
        slug: post.slug,
    }));
};

const PostPage = (props) => {
    const slug = props.params.slug;
    const post = getPostContent(slug);
    return (
        <div>
            <Header />
            <div className="mt-32 w-full flex justify-center items-center">
                <article className="prose">
                    <Markdown>{post.content}</Markdown>
                </article>
            </div>
            <Footer />
        </div>
    );
};

export default PostPage;
