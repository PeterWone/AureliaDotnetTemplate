select
  Contact_Key, FirstName, Surname, [Password]
from
  contact
where 1=1
  and ID_Company='GERSHWIN'
  and [Type] = '06'
  and Active != 'F'
