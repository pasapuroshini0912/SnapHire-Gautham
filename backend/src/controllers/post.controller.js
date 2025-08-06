import Post from '../models/post.model.js';

export const createPost = async (req, res) => {
  try {
    console.log('Creating post with data:', req.body);
    
    if (!req.body.content) {
      return res.status(400).json({ error: 'Post content is required' });
    }

    const post = await Post.create({ 
      ...req.body, 
      user: req.user._id 
    });

    console.log('Post created successfully:', post);

    const populatedPost = await Post.findById(post._id)
      .populate('user', 'name avatar')
      .populate('relatedJob', 'title company')
      .populate('relatedCompany', 'name logo');

    return res.status(201).json(populatedPost);
  } catch (error) {
    console.error('Error creating post:', error);
    return res.status(500).json({ 
      error: error.message,
      details: error.errors ? Object.values(error.errors).map(e => e.message) : []
    });
  }
};

export const getAllPosts = async (req, res) => {
  try {
    const { page = 1, limit = 10, type } = req.query;
    const query = type ? { type } : {};
    
    console.log('Fetching posts with query:', query);

    const posts = await Post.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .populate('user', 'name avatar')
      .populate('relatedJob', 'title company')
      .populate('relatedCompany', 'name logo');

    const total = await Post.countDocuments(query);

    console.log(`Found ${posts.length} posts out of ${total} total`);

    return res.status(200).json({
      posts,
      currentPage: parseInt(page),
      totalPages: Math.ceil(total / limit),
      total
    });
  } catch (error) {
    console.error('Error fetching posts:', error);
    return res.status(500).json({ error: error.message });
  }
};

export const updatePost = async (req, res) => {
  try {
    const { id } = req.params;
    const post = await Post.findById(id);

    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    if (post.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Not authorized to update this post' });
    }

    const updatedPost = await Post.findByIdAndUpdate(
      id,
      { ...req.body },
      { new: true }
    ).populate('user', 'name avatar')
     .populate('relatedJob', 'title company')
     .populate('relatedCompany', 'name logo');

    return res.status(200).json(updatedPost);
  } catch (error) {
    console.error('Error updating post:', error);
    return res.status(500).json({ error: error.message });
  }
};

export const deletePost = async (req, res) => {
  try {
    const { id } = req.params;
    const post = await Post.findById(id);

    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    if (post.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Not authorized to delete this post' });
    }

    await post.remove();
    return res.status(200).json({ message: 'Post deleted successfully' });
  } catch (error) {
    console.error('Error deleting post:', error);
    return res.status(500).json({ error: error.message });
  }
};
