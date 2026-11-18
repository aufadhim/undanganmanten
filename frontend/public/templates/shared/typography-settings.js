/** One interpretation of template/reset/scoped metrics for editor and renderer. */
export const TYPOGRAPHY_METRICS=Object.freeze({formWidth:1,formGap:14,headingScale:1,bodyScale:1,headingLineHeight:1.15,bodyLineHeight:1.65,headingLetterSpacing:0,bodyLetterSpacing:0});
export function resolveTypographyMetrics(options={},scope){
 const section=options.sections?.[scope];
 if(section?.metricsMode==='template')return {...TYPOGRAPHY_METRICS,metricsMode:'template'};
 if(section)return {...TYPOGRAPHY_METRICS,...section,metricsMode:'custom'};
 if(options.metricsMode==='template')return {...TYPOGRAPHY_METRICS,metricsMode:'template'};
 const hasMetrics=Object.keys(TYPOGRAPHY_METRICS).some(key=>Object.hasOwn(options,key));
 return {...TYPOGRAPHY_METRICS,...options,metricsMode:hasMetrics?'custom':'template'};
}
