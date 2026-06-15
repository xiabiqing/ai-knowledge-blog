package fun.xiabiqing.constant;

public class MysqlConstant {
    public static final String INIT_ENVIRONMENT = """
            CREATE SCHEMA IF NOT EXISTS blog COLLATE utf8mb4_general_ci;
         
             CREATE TABLE IF NOT EXISTS article
             (
                 id               int auto_increment
                     primary key,
                 title            varchar(1000)                      not null comment '标题',
                 source_file_path varchar(200)                       null comment '源文件路径',
                 description      varchar(3000)                      not null comment '问题描述',
                 experience       varchar(3000)                      not null comment '学习精华',
                 createtime       datetime default CURRENT_TIMESTAMP not null,
                 updatetime       datetime default CURRENT_TIMESTAMP not null comment '更新时间',
                 is_delete        tinyint  default 0                 not null comment '逻辑删除'
             )
                 comment '文章表';
            
             CREATE TABLE IF NOT EXISTS conversation
             (
                 id         varchar(36)                        not null
                     primary key,
                 title      varchar(100)                       null comment '标题',
                 count      int                                null comment '消息数量',
                 createtime datetime default CURRENT_TIMESTAMP null comment '创建时间',
                 updatetime datetime default CURRENT_TIMESTAMP null,
                 is_delete  tinyint  default 0                 null
             )
                 comment '会话表';
            
             CREATE TABLE IF NOT EXISTS conversation_message
             (
                 id              bigint auto_increment
                     primary key,
                 conversation_id varchar(36)                        not null,
                 role            varchar(50)                        not null comment '角色',
                 content         varchar(3000)                      null comment '内容',
                 createtime      datetime default CURRENT_TIMESTAMP null,
                 updatetime      datetime default CURRENT_TIMESTAMP null,
                 constraint conversation_index_id
                     foreign key (conversation_id) references conversation (id)
             )
                 comment '会话消息表';
            
             CREATE TABLE IF NOT EXISTS empirical_knowledge
             (
                 id             int auto_increment
                     primary key,
                 article_id_emp int                                null comment '外键关联文章id',
                 type           varchar(100)                       not null comment '类型',
                 title          varchar(200)                       not null,
                 content        varchar(1500)                      not null,
                 frequency      int      default 0                 not null comment '频率',
                 score          int                                not null comment 'AI价值评分',
                 createtime     datetime default CURRENT_TIMESTAMP not null,
                 updatetime     datetime default CURRENT_TIMESTAMP not null,
                 is_delete      tinyint  default 0                 null,
                 constraint article_id_emp
                     foreign key (article_id_emp) references article (id)
             )
                 comment '学习精华表' collate = utf8mb4_unicode_ci;
            """;
}
