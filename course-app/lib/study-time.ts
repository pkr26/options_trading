export const DEFAULT_STUDY_ZONE="America/Phoenix";
const clocks=new Map<string,Intl.DateTimeFormat>();

function clockFor(zone:string):Intl.DateTimeFormat{
  let clock=clocks.get(zone);
  if(!clock){
    clock=new Intl.DateTimeFormat("en-US",{
      timeZone:zone,year:"numeric",month:"short",day:"numeric",hour:"numeric",minute:"2-digit",timeZoneName:"shortOffset",
    });
    clocks.set(zone,clock);
  }
  return clock;
}

export function formatStudyTime(iso:string,zone=DEFAULT_STUDY_ZONE):string{
  const instant=new Date(iso);
  if(!Number.isFinite(instant.getTime()))return "Date unavailable";
  try{return clockFor(zone).format(instant)+" ("+zone+")";}
  catch(error){
    if(!(error instanceof RangeError))throw error;
    return clockFor(DEFAULT_STUDY_ZONE).format(instant)+" ("+DEFAULT_STUDY_ZONE+")";
  }
}
