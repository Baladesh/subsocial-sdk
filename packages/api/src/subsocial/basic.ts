import { ApiPromise as SubstrateApi } from '@polkadot/api';
import { SpaceData, CommonData, PostData, ProfileData } from '@subsocial/types';
import { SocialAccountWithId } from '@subsocial/types/dto';
import { SpaceContent, CommonContent, IpfsCid, PostContent, ProfileContent } from '@subsocial/types/offchain';
import { AnyAccountId, AnySpaceId, AnyPostId, CommonStruct } from '@subsocial/types/substrate';
import { Space, Post, SocialAccount, SpaceId } from '@subsocial/types/substrate/interfaces';
import { getFirstOrUndefined } from '@subsocial/utils';
import { getCidsOfStructs, getIpfsCidOfStruct, SubsocialIpfsApi } from '../ipfs';
import { SubsocialSubstrateApi } from '../substrate';
import { getUniqueIds, SupportedSubstrateId } from '../utils/common';
import { FindPostQuery, FindSpacesQuery, FindPostsQuery, FindSpaceQuery } from '../filters';
import { contentFilter } from '../filters/content-filter';
import { SubsocialContext, ContentResult } from '../types';


export type SubsocialApiProps = SubsocialContext & {
  substrateApi: SubstrateApi,
  ipfsNodeUrl: string,
  offchainUrl: string
}

/** Using this class, you can get all the data of posts, spaces and profiles from blockchain storages and ipfs */
export class BasicSubsocialApi {

  /** Gives access to subsocial substrate api*/
  private _substrate: SubsocialSubstrateApi

  /** Gives access to subsocial ipfs api*/
  private _ipfs: SubsocialIpfsApi

  constructor (props: SubsocialApiProps) {
    const { substrateApi, ipfsNodeUrl, offchainUrl, ...context } = props
    this._substrate = new SubsocialSubstrateApi({ api: substrateApi, ...context })
    this._ipfs = new SubsocialIpfsApi({ ipfsNodeUrl, offchainUrl, ...context })
  }
  /** Accessors for privat field {@link _substrate}*/
  public get substrate (): SubsocialSubstrateApi {
    return this._substrate
  }
  /** Accessors for privat field {@link _ipfs}*/
  public get ipfs (): SubsocialIpfsApi {
    return this._ipfs
  }

  /** Get an array of data from blockchain storages and ipfs that is passed in the parameters of the method
   * @param findStructs gets an array of structures by ids
   * @param findContents gets contents by cids
  */
  private async findDataArray<
    Id extends SupportedSubstrateId,
    Struct extends CommonStruct,
    Content extends CommonContent
  > (
    ids: Id[],
    findStructs: (ids: Id[]) => Promise<Struct[]>,
    findContents: (cids: IpfsCid[]) => Promise<ContentResult<Content>>
  ): Promise<CommonData<Struct, Content>[]> {

    const structs = await findStructs(ids)
    const cids = getUniqueIds(getCidsOfStructs(structs))
    const contents = await findContents(cids)

    return structs.map(struct => {
      const hash = getIpfsCidOfStruct(struct)
      const content = hash ? contents[hash] : undefined
      return { struct, content }
    })
  }

  // ---------------------------------------------------------------------
  // Multiple
  /** Find and load an array of spaces */
  async findSpaces (filter: FindSpacesQuery): Promise<SpaceData[]> {
    const findStructs = this.substrate.findSpaces.bind(this.substrate, filter);
    const findContents = this.ipfs.findSpaces.bind(this.ipfs);
    const spaces = await this.findDataArray<AnySpaceId, Space, SpaceContent>(
      filter.ids, findStructs, findContents
    )
    return contentFilter({
      structs: spaces,
      withContentOnly: filter.withContentOnly
    })
  }
  /** Find and load an array of posts */
  async findPosts (filter: FindPostsQuery): Promise<PostData[]> {
    const findStructs = this.substrate.findPosts.bind(this.substrate, filter)
    const findContents = this.ipfs.findPosts.bind(this.ipfs)
    const posts = await this.findDataArray<AnyPostId, Post, PostContent>(
      filter.ids, findStructs, findContents
    )

    return contentFilter({
      structs: posts,
      withContentOnly: filter.withContentOnly
    })
  }
  /** Find and load an array of profiles */
  async findProfiles (ids: AnyAccountId[]): Promise<ProfileData[]> {
    const socialAccounts = await this.substrate.findSocialAccounts(ids)
    const spaceIds: SpaceId[] = []

    socialAccounts.forEach(x => {
      if (x.profile.isSome) {
        const spaceId = x.profile.unwrap()
        spaceIds.push(spaceId)
      }
    })

    const spaces = await this.findSpaces({ ids: spaceIds })

    const spaceBySpaceId = new Map<string, SpaceData>()

    spaces.forEach(x => {
      spaceBySpaceId.set(x.struct.id.toString(), x)
    })


    return socialAccounts.map(x => {
      const maybeSpaceId = x.profile.unwrapOr(undefined)?.toString()

      const maybeSpaceData = maybeSpaceId ? spaceBySpaceId.get(maybeSpaceId) : undefined
      
      return {
        socialAccount: x,
        space: maybeSpaceData?.struct,
        content: maybeSpaceData?.content
      }
    })
  }

  // ---------------------------------------------------------------------
  // Single
  /** Find and load single space */
  async findSpace ({ id, visibility }: FindSpaceQuery): Promise<SpaceData | undefined> {
    return getFirstOrUndefined(await this.findSpaces({ ids: [ id ], visibility }))
  }
  /** Find and load single post */
  async findPost ({ id, visibility }: FindPostQuery): Promise<PostData | undefined> {
    return getFirstOrUndefined(await this.findPosts({ ids: [ id ], visibility }))
  }
  /** Find and load single profile */
  async findProfile (id: AnyAccountId): Promise<ProfileData | undefined> {
    return getFirstOrUndefined(await this.findProfiles([ id ]))
  }
}
