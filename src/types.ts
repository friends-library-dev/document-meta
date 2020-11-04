import * as t from 'io-ts';
import { isRight } from 'fp-ts/Either';
import { PRINT_SIZE_VARIANTS, PRINT_SIZES } from '@friends-library/types';

// sanity check for hacks below...
if (PRINT_SIZES.length !== 3) {
  throw new Error(`Unexpected size of PRINT_SIZE_VARIANTS`);
}
if (PRINT_SIZE_VARIANTS.length !== 4) {
  throw new Error(`Unexpected size of PRINT_SIZE_VARIANTS`);
}

const AudioQualityData = t.strict({
  mp3ZipSize: t.number,
  m4bSize: t.number,
  parts: t.array(t.strict({ mp3Size: t.number })),
});

const EditionMeta = t.intersection([
  t.strict({
    updated: t.string,
    published: t.string,
    adocLength: t.number,
    numSections: t.number,
    revision: t.string,
    productionRevision: t.string,
    paperback: t.type({
      size: t.union([
        // hack
        t.literal(PRINT_SIZES[0]),
        t.literal(PRINT_SIZES[1]),
        t.literal(PRINT_SIZES[2]),
      ]),
      volumes: t.array(t.number),
      condense: t.boolean,
      pageData: t.intersection([
        t.strict({
          single: t.record(
            t.union([
              // hack
              t.literal(PRINT_SIZE_VARIANTS[0]),
              t.literal(PRINT_SIZE_VARIANTS[1]),
              t.literal(PRINT_SIZE_VARIANTS[2]),
              t.literal(PRINT_SIZE_VARIANTS[3]),
            ]),
            t.number,
          ),
        }),
        t.exact(
          t.partial({
            split: t.strict({
              m: t.array(t.number),
              xl: t.array(t.number),
              'xl--condensed': t.array(t.number),
            }),
          }),
        ),
      ]),
    }),
  }),
  t.exact(
    t.partial({
      audio: t.strict({
        durations: t.array(t.number),
        HQ: AudioQualityData,
        LQ: AudioQualityData,
      }),
    }),
  ),
]);

const Meta = t.record(t.string, EditionMeta);

export type Meta = t.TypeOf<typeof Meta>;
export type EditionMeta = t.TypeOf<typeof EditionMeta>;
export type PageData = EditionMeta['paperback']['pageData'];

export function isValidMeta(meta: unknown): meta is Meta {
  return isRight(Meta.decode(meta));
}

export function isValidEditionMeta(edMeta: unknown): edMeta is EditionMeta {
  return isRight(EditionMeta.decode(edMeta));
}

export function assertValidMeta(meta: unknown): asserts meta is Meta {
  const result = Meta.decode(meta);
  if (!isRight(result)) {
    console.error(result.left);
    throw new Error(`Invalid document-meta meta`);
  }
}

export function assertValidEditionMeta(edMeta: unknown): asserts edMeta is EditionMeta {
  const result = EditionMeta.decode(edMeta);
  if (!isRight(result)) {
    console.error(result.left);
    throw new Error(`Invalid document-meta edition meta`);
  }
}

export function cleanEditionMeta(edMeta: EditionMeta): EditionMeta {
  const result = EditionMeta.decode(edMeta);
  return isRight(result) ? result.right : edMeta;
}

export function cleanMeta(meta: Meta): Meta {
  const result = Meta.decode(meta);
  return isRight(result) ? result.right : meta;
}
