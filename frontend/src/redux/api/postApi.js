import { api } from "../api";

export const postApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getAllPosts: builder.query({
      query: ({ page = 1, limit = 10, type } = {}) => {
        let url = `/post/feed?page=${page}&limit=${limit}`;
        if (type) url += `&type=${type}`;
        return url;
      },
      providesTags: ["Posts"],
      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled;
        } catch (error) {
          console.error('Failed to fetch posts:', error);
        }
      },
    }),
    createPost: builder.mutation({
      query: (data) => {
        console.log('Creating post with data:', data);
        return {
          url: "/post/create",
          method: "POST",
          body: data,
          // Add error handling for network/timeout issues
          timeout: 10000,
          headers: {
            'Content-Type': 'application/json',
          }
        };
      },
      invalidatesTags: ["Posts"],
      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          console.log('Post created successfully:', data);
        } catch (error) {
          console.error('Failed to create post:', error?.data?.message || error.message || 'Network error occurred');
          // Transform error for better user feedback
          throw new Error(error?.data?.message || error.message || 'Failed to create post. Please check your connection and try again.');
        }
      },
    }),
    likePost: builder.mutation({
      query: (postId) => ({
        url: `/post/${postId}/like`,
        method: "POST",
      }),
      invalidatesTags: ["Posts"],
      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          console.log('Post liked successfully:', data);
        } catch (error) {
          console.error('Failed to like post:', error);
          throw error;
        }
      },
    }),
    commentOnPost: builder.mutation({
      query: ({ postId, content }) => ({
        url: `/post/${postId}/comment`,
        method: "POST",
        body: { content },
      }),
      invalidatesTags: ["Posts"],
    }),
  }),
});

export const {
  useGetAllPostsQuery,
  useCreatePostMutation,
  useLikePostMutation,
  useCommentOnPostMutation,
} = postApi;
