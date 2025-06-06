import Header from "@/components/Header";
import Footer from "@/components/Footer";
import BlogList from "./BlogList";

const blogs = () => {
    // const postMetadata = getPostMetadata();

    // Markdown => md => html => blog
    return (
        <>
            <Header />
            <BlogList />
            <Footer />
        </>

    );
};

export default blogs;
