SELECT
  l.DoorOrWindow
  ,(SELECT COUNT(*) FROM ItemOptions I JOIN Component C ON I.ID_Component=C.ID_Component WHERE I.OrderLine_Key=L.OrderLine_Key AND LEFT([Name],7)='MID RAI') Midrails
  ,(SELECT COUNT(*) FROM ItemOptions I JOIN Component C ON I.ID_Component=C.ID_Component WHERE I.OrderLine_Key=L.OrderLine_Key AND LEFT([Name],7)='MULLION') Mullions
  ,LEFT(l.Type,2) [MeshType]
  ,L.MaxDrop, L.MaxWidth
FROM OrderLines L
WHERE OrderLine_Key=:OrderLine_Key