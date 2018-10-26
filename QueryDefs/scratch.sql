--select NodeId, [Value] FROM conf.KeyValueTree where ParentId in ('FRAMEOFFSETS', 'MIDOFFSETS')
--select * FROM conf.KeyValueTree where ParentId in ('FRAMEOFFSETS', 'MIDOFFSETS')
select * from MeshType where active='T'

--select type, count(*) from OrderLines where type like 'sl%' and infactory > '2018-9-1' group by type
