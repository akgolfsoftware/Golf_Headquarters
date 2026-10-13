import { test } from "node:test";
import assert from "node:assert/strict";
import { videoHeaderMatches } from "./video-header";
const atom = (kind: string, brand: string) => { const bytes=Buffer.alloc(24);bytes.writeUInt32BE(24);bytes.write(kind,4);bytes.write(brand,8);return bytes; };
test("avviser tekst eller HTML som er omdøpt til video", () => {
  for(const mime of ["video/mp4","video/quicktime","video/webm"]) assert.equal(videoHeaderMatches(Buffer.from("<html>falsk video</html>"),mime),false);
});
test("godtar de støttede MP4- og MOV-containerhodene", () => {
  assert.equal(videoHeaderMatches(atom("ftyp","isom"),"video/mp4"),true);
  assert.equal(videoHeaderMatches(atom("ftyp","mp42"),"video/mp4"),true);
  assert.equal(videoHeaderMatches(atom("ftyp","qt  "),"video/quicktime"),true);
  assert.equal(videoHeaderMatches(atom("moov",""),"video/quicktime"),true);
  const wide=atom("wide", "");wide.writeUInt32BE(8);assert.equal(videoHeaderMatches(wide,"video/quicktime"),true);
});
test("bilder og lyd i samme containerfamilie regnes ikke som MP4-video", () => {
  for(const brand of ["heic","avif","M4A ","M4B "]) assert.equal(videoHeaderMatches(atom("ftyp",brand),"video/mp4"),false);
});
test("avviser avkuttet atom og feil deklarert container", () => {
  const bytes=atom("ftyp","isom");bytes.writeUInt32BE(100);
  assert.equal(videoHeaderMatches(bytes,"video/mp4"),false);
  assert.equal(videoHeaderMatches(atom("ftyp","isom"),"video/quicktime"),false);
  assert.equal(videoHeaderMatches(new Uint8Array(0),"video/mp4"),false);
});
test("WEBM krever EBML-hode og WEBM-doctype", () => {
  const bytes=Buffer.concat([Buffer.from([0x1a,0x45,0xdf,0xa3]),Buffer.from("doctype: webm")]);
  assert.equal(videoHeaderMatches(bytes,"video/webm"),true);
  assert.equal(videoHeaderMatches(Buffer.from([0x1a,0x45,0xdf,0xa3]),"video/webm"),false);
  assert.equal(videoHeaderMatches(bytes,"video/mp4"),false);
});
