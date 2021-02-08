import { isEmptyStr } from './string'
import truncate from 'lodash.truncate'

const DEFAULT_SUMMARY_LEN = 300

const SEPARATOR = /[.,:;!?()[\]{}\s]+/

type SummarizeOpt = {
  limit?: number,
  omission?: string;
}

//TODO: remove because was extracted to @subsocial/utils
/** Shorten a plain text up to `limit` chars. Split by separators. */
export const summarize = (
  text: string,
  opts: SummarizeOpt = {}
): string => {
  if (isEmptyStr(text)) return ''

  text = (text as string).trim()

  const {
    limit = DEFAULT_SUMMARY_LEN,
    omission = '...'
  } = opts

  return text.length <= limit
    ? text
    : truncate(text, {
      length: limit,
      separator: SEPARATOR,
      omission
    })
}
