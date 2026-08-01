// Builds a single EMVCo TLV field: tag (2 digits) + length (2 digits) + value
function tlv(tag, value) {
  const len = String(value.length).padStart(2, "0");
  return `${tag}${len}${value}`;
}

module.exports = { tlv };