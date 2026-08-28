/**
 * Normalises the two attachment shapes the API has returned over time: a
 * `files` array on newer records, and the flat `fileUrl` / `fileName` /
 * `fileType` trio on older ones.
 */
export const attachmentsOf = (item) => {
  if (item?.files?.length) return item.files;
  if (item?.fileUrl) {
    return [
      {
        url: item.fileUrl,
        name: item.fileName || 'Attachment',
        type: item.fileType || 'document',
      },
    ];
  }
  return [];
};
