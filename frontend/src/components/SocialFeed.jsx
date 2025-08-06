import React, { useState } from "react";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { toast } from "sonner";
import {
  useGetAllPostsQuery,
  useCreatePostMutation,
  useLikePostMutation,
  useCommentOnPostMutation,
} from "@/redux/api/postApi";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import {
  Heart,
  MessageCircle,
  Share,
  MoreHorizontal,
  Send,
} from "lucide-react";

const SocialFeed = ({ user }) => {
  const [newPost, setNewPost] = useState("");
  const [postType, setPostType] = useState("general");
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { data: postsData, isLoading, isError, error, refetch } = useGetAllPostsQuery(
    {},
    { 
      refetchOnMountOrArgChange: true,
      refetchOnReconnect: true,
      refetchOnFocus: true 
    }
  );
  const [createPost] = useCreatePostMutation();
  const [likePost] = useLikePostMutation();
  const [commentOnPost] = useCommentOnPostMutation();

  // Handle API errors with retry logic
  React.useEffect(() => {
    if (isError) {
      console.error('Social feed error:', error);
      
      const retryTimeout = setTimeout(() => {
        console.log('Attempting to reload social feed...');
        refetch().catch((retryError) => {
          console.error('Retry failed:', retryError);
          toast.error('Failed to load social feed. Please try again later.');
        });
      }, 3000);
      
      return () => clearTimeout(retryTimeout);
    }
  }, [isError, error, refetch]);

  const handleSubmitPost = () => {
    if (!newPost.trim()) {
      toast.error('Please enter some content for your post');
      return;
    }

    setIsSubmitting(true);
    
    // Add retry logic with Promise chaining
    let retryCount = 0;
    const maxRetries = 2;
    
    const attemptPost = () => {
      return createPost({
        content: newPost.trim(),
        type: postType,
      })
      .unwrap()
      .then((response) => {
        toast.success('Post created successfully!');
        setNewPost('');
      })
      .catch((error) => {
        console.error('Post attempt failed:', error);
        if (retryCount < maxRetries) {
          retryCount++;
          return new Promise(resolve => 
            setTimeout(() => resolve(attemptPost()), 1000 * retryCount)
          );
        }
        throw error;
      });
    };

    attemptPost()
      .catch((error) => {
        console.error('Failed to create post after retries:', error);
        toast.error(error?.data?.message || 'Failed to create post. Please try again.');
      })
      .finally(() => {
        setIsSubmitting(false);
      });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-zinc-500"></div>
        <p className="ml-3 text-zinc-400">Loading posts...</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="text-center py-8">
        <p className="text-zinc-400 mb-4">Unable to load posts. This could be due to:</p>
        <ul className="text-zinc-500 mb-4 list-disc list-inside">
          <li>Network connection issues</li>
          <li>Server temporarily unavailable</li>
          <li>Session timeout</li>
        </ul>
        <button
          onClick={() => refetch()}
          className="px-4 py-2 bg-zinc-800 text-zinc-200 rounded hover:bg-zinc-700 transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  const handleLike = (postId) => {
    likePost(postId)
      .unwrap()
      .then(() => {
        toast.success('Post liked successfully');
      })
      .catch((error) => {
        console.error('Failed to like post:', error);
        toast.error('Failed to like post. Please try again.');
      });
  };

  const handleComment = (postId, comment) => {
    if (!comment.trim()) {
      toast.error('Please enter a comment');
      return;
    }

    commentOnPost({ postId, content: comment.trim() })
      .unwrap()
      .then(() => {
        toast.success('Comment added successfully');
      })
      .catch((error) => {
        console.error('Failed to add comment:', error);
        toast.error('Failed to add comment. Please try again.');
      });
  };

  return (
    <div className="space-y-6 p-4">
      {/* Create Post Section */}
      <div className="bg-zinc-900 rounded-lg p-4 space-y-4 border border-zinc-800">
        <Textarea
          value={newPost}
          onChange={(e) => setNewPost(e.target.value)}
          placeholder="Share your thoughts..."
          className="bg-zinc-800 border-zinc-700 text-zinc-200 placeholder:text-zinc-500"
        />
        <div className="flex justify-between items-center">
          <Select
            value={postType}
            onValueChange={setPostType}
          >
            <SelectTrigger className="w-[180px] bg-zinc-800 border-zinc-700 text-zinc-200">
              <SelectValue placeholder="Post type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="general">General</SelectItem>
              <SelectItem value="job_review">Job Review</SelectItem>
              <SelectItem value="company_review">Company Review</SelectItem>
              <SelectItem value="interview_exp">Interview Experience</SelectItem>
            </SelectContent>
          </Select>
          <Button 
            onClick={handleSubmitPost}
            disabled={isSubmitting}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            {isSubmitting ? "Posting..." : "Post"}
          </Button>
        </div>
      </div>

      {/* Posts List */}
      <div className="space-y-4">
        {postsData?.posts?.map((post) => (
          <div key={post._id} className="bg-zinc-900 rounded-lg p-4 border border-zinc-800">
            {/* Post Header */}
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center space-x-3">
                <Avatar>
                  <AvatarImage src={post.user?.avatar} />
                  <AvatarFallback>{post.user?.name?.[0]}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-semibold text-zinc-200">{post.user?.name}</p>
                  <p className="text-sm text-zinc-400">{new Date(post.createdAt).toLocaleDateString()}</p>
                </div>
              </div>
              <Button variant="ghost" size="icon">
                <MoreHorizontal className="h-4 w-4 text-zinc-400" />
              </Button>
            </div>

            {/* Post Content */}
            <p className="text-zinc-200 mb-4">{post.content}</p>

            {/* Post Actions */}
            <div className="flex items-center space-x-4 text-zinc-400">
              <button
                onClick={() => handleLike(post._id)}
                className="flex items-center space-x-1 hover:text-zinc-200 transition-colors"
              >
                <Heart className="h-5 w-5" />
                <span>{post.likes?.length || 0}</span>
              </button>
              <button className="flex items-center space-x-1 hover:text-zinc-200 transition-colors">
                <MessageCircle className="h-5 w-5" />
                <span>{post.comments?.length || 0}</span>
              </button>
              <button className="flex items-center space-x-1 hover:text-zinc-200 transition-colors">
                <Share className="h-5 w-5" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SocialFeed;
