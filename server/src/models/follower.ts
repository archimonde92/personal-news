type EBlog = "MongoDB" | "Typescript"

type Follower = {
    id: string;
    username: string;
    languageCode: string;
    subscribedBlogs: EBlog[];
    createdAt: Date;
    updatedAt: Date;
}

export { Follower, EBlog };