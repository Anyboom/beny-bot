import { Injectable } from '@nestjs/common';
import { PostType } from '@/modules/posts/types/post.type';

@Injectable()
export class PostsRepository {
  private posts: PostType[] = [];

  public findFirst(id: string) {
    return this.posts.find((post: PostType) => post.id === id);
  }

  public create(post: PostType) {
    this.posts.push(post);
  }

  public remove(id: string) {
    this.posts = this.posts.filter((post: PostType) => post.id !== id);
  }
}
