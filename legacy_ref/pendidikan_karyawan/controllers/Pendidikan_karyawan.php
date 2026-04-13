<?php
defined('BASEPATH') or exit('No direct script access allowed');
class Pendidikan_karyawan extends CI_Controller
{
    function __construct()
    {
        // Construct the parent class
        parent::__construct();
        is_logged_in();
        $this->load->model('model_pendidikan');
        $this->load->model('data_param');
    }
    public function index()
    {
        $data['titel'] = 'Riwayat Pendidikan';
        $prodi = $this->session->userdata('prodi');
        $data['karyawan'] = $this->model_pendidikan->get_karyawan($prodi);
        $this->load->view('page_pendidikan', $data);
    }
    public function riwayat($nik)
    {
        $data['titel'] = 'Riwayat Pendidikan';
        $data['pendidikan'] = $this->model_pendidikan->get_pendidikan($nik);
        $data['riwayat'] = $this->model_pendidikan->get_riwayat_pendidikan($nik);
        $data['jenjang'] = $this->model_pendidikan->get_jenjang();
        $this->load->view('page_index', $data);
    }
    public function insert_pendidikan()
    {
        $nik = $this->input->post('nik');
        $jenjang = $this->input->post('jenjang');
        $asal_sekolah = $this->input->post('asal_sekolah');
        $tahun_lulus = $this->input->post('tahun_lulus');
        $data = [
            'nik' => $nik,
            'id_pendidikan' => $jenjang,
            'asal_pendidikan' => $asal_sekolah,
            'tahun_lulus' => $tahun_lulus
        ];
        $this->model_pendidikan->insert_pendidikan($data);
        $this->session->set_flashdata(' message ', ' berhasil Di Insert');
        redirect('pendidikan_karyawan/riwayat/' . $nik);
    }
    public function upload_ijazah()
    {
        $nik = $this->input->post('nik');
        $id = $this->input->post('id');
        //upload gambar
        $config['upload_path']   = './assets/ijazah/';
        $config['allowed_types'] = 'jpg|jpeg|png|pdf';
        $this->load->library('upload', $config);
        //upload gambar
        if ($this->upload->do_upload('ijazah_upload')) {
            $file_upload = $this->upload->data();
            $data = [
                'upload_ijazah' => $file_upload['file_name'],
            ];
            $this->model_pendidikan->update_ijazah($data, $id);
            $this->session->set_flashdata(' message ', ' berhasil Di Update');
        } else {
            $error = array('error' => $this->upload->display_errors());
            var_dump($error);
        }
        $this->session->set_flashdata(' message ', ' berhasil Di Upload');
        redirect('pendidikan_karyawan/riwayat/' . $nik,  'refresh');
    }

    public function delete($id)
    {
        $ijazah = $this->model_pendidikan->get_ijazah($id);
        foreach ($ijazah as $p) {
            $nik = $p['nik'];
            $filename =  $p['upload_ijazah'];
            unlink(FCPATH . "assets/ijazah/$filename");
        }
        $this->db->delete('riwayat_pendidikan', ['id' => $id]);
        $this->session->set_flashdata(' message ', ' berhasil Di Hapus');
        redirect('pendidikan_karyawan/riwayat/' . $nik,  'refresh');
    }
}
