import {buildTypes} from "./utils";

const v0 = buildTypes({
    types: {
        PostId: "u64",
        Post: {
            id: "PostId",
            created: "WhoAndWhen",
            updated: "Option<WhoAndWhen>",
            owner: "AccountId",
            extension: "PostExtension",
            space_id: "Option<SpaceId>",
            content: "Content",
            hidden: "bool",
            replies_count: "u16",
            hidden_replies_count: "u16",
            shares_count: "u16",
            upvotes_count: "u16",
            downvotes_count: "u16",
            score: "i32",
        },
        PostUpdate: {
            space_id: "Option<SpaceId>",
            content: "Option<Content>",
            hidden: "Option<bool>",
        },
        PostExtension: {
            _enum: {
                RegularPost: "Null",
                Comment: "Comment",
                SharedPost: "PostId",
            },
        },
        Comment: {
            parent_id: "Option<PostId>",
            root_post_id: "PostId",
        },
    }})

export default [ v0 ]
