DROP TABLE IF EXISTS to_do_list CASCADE;
-- DROP TABLE IF EXISTS  complete_list;

CREATE TABLE to_do_list (
    id SERIAL PRIMARY KEY,
    name_ TEXT,
    due_by date,
    start_ Boolean,
    complete Boolean

)