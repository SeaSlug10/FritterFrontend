import type {HydratedDocument, Types} from 'mongoose';
import type {Freet} from './model';
import FreetModel from './model';
import UserCollection from '../user/collection';

/**
 * This files contains a class that has the functionality to explore freets
 * stored in MongoDB, including adding, finding, updating, and deleting freets.
 * Feel free to add additional operations in this file.
 *
 * Note: HydratedDocument<Freet> is the output of the FreetModel() constructor,
 * and contains all the information in Freet. https://mongoosejs.com/docs/typescript.html
 */
class FreetCollection {
  /**
   * Add a freet to the collection
   *
   * @param {string} authorId - The id of the author of the freet
   * @param {string} content - The id of the content of the freet
   * @return {Promise<HydratedDocument<Freet>>} - The newly created freet
   */
  static async addOne(authorId: Types.ObjectId | string, content: string, anonymous: boolean): Promise<HydratedDocument<Freet>> {
    const date = new Date();
    const freet = new FreetModel({
      authorId,
      dateCreated: date,
      content,
      dateModified: date,
      anonymous
    });
    await freet.save(); // Saves freet to MongoDB
    return freet.populate('authorId');
  }

  /**
   * Find a freet by freetId
   *
   * @param {string} freetId - The id of the freet to find
   * @return {Promise<HydratedDocument<Freet>> | Promise<null> } - The freet with the given freetId, if any
   */
  static async findOne(freetId: Types.ObjectId | string): Promise<HydratedDocument<Freet>> {
    return FreetModel.findOne({_id: freetId}).populate('authorId');
  }

  /**
   * Get all the freets in the database
   *
   * @return {Promise<HydratedDocument<Freet>[]>} - An array of all of the freets
   */
  static async findAll(): Promise<Array<HydratedDocument<Freet>>> {
    // Retrieves freets and sorts them from most to least recent
    return FreetModel.find({}).sort({dateModified: -1}).populate('authorId');
  }

  /**
   * Get all the freets in by given author
   *
   * @param {string} username - The username of author of the freets
   * @return {Promise<HydratedDocument<Freet>[]>} - An array of all of the freets
   */
  static async findAllByUsername(username: string): Promise<Array<HydratedDocument<Freet>>> {
    const author = await UserCollection.findOneByUsername(username);
    return FreetModel.find({authorId: author._id}).populate('authorId');
  }

  /**
   * Get freets from friends for user
   * 
   * @param {string} userId - the user to get feed for
   * @return {Promise<HydratedDocument<Freet>[]>} - An array of the freets
   */
  static async findFriendFreets(userId: string): Promise<Array<HydratedDocument<Freet>>> {
    const user = await UserCollection.findOneByUsername(userId);
    const friendPosts: Array<HydratedDocument<Freet>> = [];
    for (let friendname of user.friends){
      console.log(friendname)
      const friendFreets = await this.findAllByUsername(friendname);
      friendPosts.concat(friendFreets);
    }
    return friendPosts;
  }

  /**
   * Update a freet with the new content
   *
   * @param {string} freetId - The id of the freet to be updated
   * @param {string} content - The new content of the freet
   * @return {Promise<HydratedDocument<Freet>>} - The newly updated freet
   */
  static async updateOne(freetId: Types.ObjectId | string, content: string): Promise<HydratedDocument<Freet>> {
    const freet = await FreetModel.findOne({_id: freetId});
    freet.content = content;
    freet.dateModified = new Date();
    await freet.save();
    return freet.populate('authorId');
  }

  /**
   * Update a freet with an upvote or downvote
   * 
   * @param {string} freetId - the id fo the freet to be updated
   * @param {string} user - user who is voting
   * @param {string} vote - whether upvoting or downvoting, if undefined remove any vote from user
   * 
   * @return {Promise<HydratedDocument<Freet>>} - the updated freet
   */
  static async updateOneVote(freetId: Types.ObjectId | string, user: string, vote: string): Promise<HydratedDocument<Freet>>{
    const freet = await FreetModel.findOne({_id: freetId});
    //if no vote, try to remove user's current vote
    if (vote === "no vote"){
      if (freet.upvoters.includes(user)){
        const index = freet.upvoters.indexOf(user);
        freet.upvoters.splice(index, 1);
      } else if (freet.downvoters.includes(user)){
        const index = freet.downvoters.indexOf(user);
        freet.downvoters.splice(index, 1);
      }
    //if vote is upvote, add user to upvotes if not already there, and remove from downvoters if applicable
    } else if (vote === 'upvote') {
      if (!freet.upvoters.includes(user)){
        freet.upvoters.push(user);
      }
      if (freet.downvoters.includes(user)){
        const index = freet.downvoters.indexOf(user);
        freet.downvoters.splice(index, 1);
      }
    } else {
      if (!freet.downvoters.includes(user)){
        freet.downvoters.push(user);
      }
      if (freet.upvoters.includes(user)){
        const index = freet.upvoters.indexOf(user);
        freet.upvoters.splice(index, 1);
      }
    }
    freet.dateModified = new Date();
    await freet.save();
    return freet.populate('authorId')
  }

  /**
   * Delete a freet with given freetId.
   *
   * @param {string} freetId - The freetId of freet to delete
   * @return {Promise<Boolean>} - true if the freet has been deleted, false otherwise
   */
  static async deleteOne(freetId: Types.ObjectId | string): Promise<boolean> {
    const freet = await FreetModel.deleteOne({_id: freetId});
    return freet !== null;
  }

  /**
   * Delete all the freets by the given author
   *
   * @param {string} authorId - The id of author of freets
   */
  static async deleteMany(authorId: Types.ObjectId | string): Promise<void> {
    await FreetModel.deleteMany({authorId});
  }
}

export default FreetCollection;
