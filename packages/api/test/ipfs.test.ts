/* eslint-disable @typescript-eslint/no-var-requires */
import { BlogContent, PostContent, CommentContent } from '@subsocial/types/src/offchain';
import { SubsocialIpfsApi } from '../src/ipfs';
// const ipfsClient = require('ipfs-http-client')
// const ipfsConnect = ipfsClient({ host: '127.0.0.1', port: '5002', protocol: 'http' });
const ipfs = new SubsocialIpfsApi('/ip4/127.0.0.1/tcp/5002/http');

const cids = new Map();

const blogContent: BlogContent = {
  name: 'Test Blog',
  desc: 'Blog desc',
  image: '',
  tags: [ '' ]
}

const postContent: PostContent = {
  title: 'Test Post',
  body: 'Post body',
  image: '',
  tags: [ 'tag_one', 'tag_two' ]
}

const commentContent: CommentContent = {
  body: 'Comment'
}

test('Save a blog to IPFS', async () => {
  const hash = await ipfs.saveBlog(blogContent);
  cids.set('Blog', hash);
  expect(typeof hash).toBe('string');
})

test('Save a post to IPFS', async () => {
  const hash = await ipfs.savePost(postContent);
  cids.set('Post', hash);
  expect(typeof hash).toBe('string');
})

test('Save a comment to IPFS', async () => {
  const hash = await ipfs.saveComment(commentContent);
  cids.set('Comment', hash);
  expect(typeof hash).toBe('string');
})

test('Find comment', async () => {
  const struct = await ipfs.findComment(cids.get('Comment'));
  expect(struct).toEqual(commentContent);
})

test('Find post', async () => {
  const struct = await ipfs.findPost(cids.get('Post'));
  expect(struct).toEqual(postContent);
})

test('Find blog', async () => {
  const struct = await ipfs.findBlog(cids.get('Blog'));
  expect(struct).toEqual(blogContent);
})
