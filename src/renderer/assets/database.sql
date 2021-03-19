CREATE TABLE IF NOT EXISTS student (
    sno varchar(12) NOT NULL PRIMARY KEY ,
    name varchar(30) NOT NULL unique,
    age int NOT NULL
);
insert into student values ( '202100000102', 'sll&gzm', 999), ('201712300040', 'sll', 2), ('201712300099', 'gzm', 3);

DELETE FROM student where  sno = '202100000102';

insert into student values ( '202100000102', 'sll&gzm', 999);

UPDATE student set name = 'forever' where sno = '202100000102'

SELECT * from student ;