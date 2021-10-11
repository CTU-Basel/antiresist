samp.SAMPLING_NO || 
samp.STTYPE || 
SUBSTR(100 + ROW_NUMBER() OVER (PARTITION BY samp.SAMPLING_NO, samp.STTYPE ORDER BY samp.SAMPLENO), -2) ||
samp.TAPA ||
WHEN 
    samp.TAPA NOT IN ('NG', 'ND') 
    THEN samp.MOPO 
WHEN samp.TAPA  = 'NG' 
    AND samp.CO_VS_INF = 'inf' 
    THEN samp.TAPA_NG 
WHEN samp.TAPA = 'NG' 
    AND samp.CO_VS_INF = 'co' 
    THEN 'co' 
END) AS NCCRID