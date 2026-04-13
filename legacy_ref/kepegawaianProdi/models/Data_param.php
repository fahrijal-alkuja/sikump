<?php if (!defined('BASEPATH')) exit('No direct script access allowed');

class Data_param extends CI_Model
{
    public $variable;
    public function __construct()
    {
        parent::__construct();
    }

    function get_biro($id)
    {
        if (empty($id)) {
            return "-";
        } else {
            $this->db->where('id_biro', $id);
            $prodi = $this->db->get('tmst_biro');
            if ($prodi->num_rows() > 0) {
                return $prodi->row()->nama_biro;
            } else {
                return '-';
            }
        }
    }
    function get_jenjang($id)
    {
        if (empty($id)) {
            return "-";
        } else {
            $this->db->where('id', $id);
            $p = $this->db->get('tref_pendidikan');
            if ($p->num_rows() > 0) {
                return $p->row()->nama_jenjang;
            } else {
                return '-';
            }
        }
    }
    function get_jenjangPendidikan($id)
    {
        if (empty($id)) {
            return "-";
        } else {
            $this->db->where('id', $id);
            $p = $this->db->get('tref_pendidikan');
            if ($p->num_rows() > 0) {
                return $p->row()->nama_jenjang;
            } else {
                return '-';
            }
        }
    }
}

/* End of file Data_param.php */
