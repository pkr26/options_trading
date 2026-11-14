import type { RecordedReview } from "./teaching-types";

export function reviewCalibration(reviews:RecordedReview[]){
  const grouped=new Map<string,Map<string,RecordedReview>>();
  for(const review of [...reviews].sort((a,b)=>Date.parse(b.reviewedAt)-Date.parse(a.reviewedAt))){
    if(review.reviewerRole!=="reported_external")continue;
    const key=review.reviewerName.trim().toLowerCase();
    if(!key)continue;
    const people=grouped.get(review.submissionId)??new Map<string,RecordedReview>();
    if(!people.has(key))people.set(key,review);
    grouped.set(review.submissionId,people);
  }
  return [...grouped.entries()].filter(([,people])=>people.size>=2).map(([submissionId,people])=>{
    const records=[...people.values()],dimensions=[...new Set(records.flatMap(review=>review.criteria.map(item=>item.dimension)))];
    return {submissionId,reviewers:records.map(review=>review.reviewerName),decisionConflict:new Set(records.map(review=>review.decision)).size>1,
      criteria:dimensions.map(dimension=>{const scores=records.flatMap(review=>review.criteria.filter(item=>item.dimension===dimension).map(item=>item.score));const minimum=Math.min(...scores),maximum=Math.max(...scores);return {dimension,minimum,maximum,range:maximum-minimum,ratings:scores.length};})};
  });
}
