package fun.xiabiqing.constant;

public class EsConstant {
    public static final String INDEX_NAME_EMPIRICAL = "empiricalknowledge";
    public static final String EMPIRICAL_SUGGEST="empiricalsuggest";
    public static final String CREATE_INDEX_EMPIRICAL_KNOWLEDGE = """
            {
              "settings": {
                "analysis": {
                  "analyzer": {
                    "text_analyzer":{
                      "tokenizer":"ik_max_word",
                      "filter":"py"
                    },
                    "completion_analyzer":{
                      "tokenizer":"ik_smart",
                      "filter":"py"
                    }
                  },
                  "filter": {
                    "py":{
                     "type":"pinyin",
                     "keep_full_pinyin":false,
                     "keep_joined_full_pinyin":true,
                     "keep_original":true
                    }
                  }
                 \s
                }
            },\s
              "mappings": {
                "properties": {
                 "id":{
                   "type": "keyword",
                   "index": false
                 },
                 "article_id_emp":{
                   "type": "keyword",
                   "index": false
                 },
                 "type":{
                   "type": "keyword"
                 },
                 "title":{
                   "type": "text",
                   "analyzer": "text_analyzer",
                   "search_analyzer": "ik_smart",
                   "copy_to": "suggestions"
                 },
                 "content":{
                   "type": "text",
                   "analyzer": "ik_max_word",
                    "search_analyzer": "ik_smart"
                 },
                 "frequency":{
                   "type": "integer"
                 },
                 "score":{
                   "type": "integer"
                 },
                "createtime": {
                    "type": "date",
                    "format": "yyyy-MM-dd HH:mm:ss||epoch_millis"
                  },
                  "updatetime": {
                    "type": "date",
                    "format": "yyyy-MM-dd HH:mm:ss||epoch_millis"
                  },
                  "suggestions":{
                    "type": "completion",
                    "analyzer": "completion_analyzer",
                    "search_analyzer": "completion_analyzer"
                  }
                }
              }
            }
            
            
            
            """;
}
